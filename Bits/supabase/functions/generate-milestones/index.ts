import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the list of valid Lucide icon names as used in the prompt
const VALID_LUCIDE_ICONS = [
  'Trophy', 'Star', 'CheckCircle2', 'Footprints', 'BookOpen', 'Dumbbell', 'Heart', 'Brain', 'Mountain', 'Sun', 'Coffee', 'Pizza', 'Bike', 'Award', 'Sparkles', 'Target', 'Medal', 'Ribbon', 'Gem', 'Crown', 'Feather', 'Zap', 'Flame', 'Leaf', 'Clock'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endGoal } = await req.json();

    if (!endGoal) {
      return new Response(JSON.stringify({ error: 'End goal is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
    const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN");

    if (!HF_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'Hugging Face API token (HF_API_TOKEN) not set in Supabase secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Updated prompt to request both milestones and achievements with a curated list of valid Lucide icon names (PascalCase)
    const promptContent = `Generate 3-4 incremental milestones and 2-3 custom achievements for the goal: "${endGoal}".
    Each milestone should have a "goal" (string, e.g., "Walk 1000 steps") and "targetDays" (number, e.g., 3).
    Each achievement should have a "name" (string), "description" (string), and a "lucide_icon_name" (string, a valid Lucide icon component name from this exact list: ${VALID_LUCIDE_ICONS.map(icon => `'${icon}'`).join(', ')}).
    Return only a JSON object with two keys: "milestones" (array of milestone objects) and "achievements" (array of achievement objects).
    Do not include any other text or formatting.
    Example: {"milestones": [{"goal": "Start with 1000 steps", "targetDays": 3}], "achievements": [{"name": "First Step", "description": "Completed your first step", "lucide_icon_name": "Footprints"}]}`;

    const response = await fetch(HF_API_URL, {
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: promptContent,
          }
        ],
        model: "CohereLabs/aya-expanse-8b:cohere",
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error: Status ${response.status} (${response.statusText}), Body: ${errorText}`);
      return new Response(JSON.stringify({ error: `AI API error: Status ${response.status}, Message: ${errorText}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error("No generated text found in AI response:", data);
      return new Response(JSON.stringify({ error: 'AI did not return expected text content.', rawResponse: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let parsedResponse;
    try {
      // Extract only the JSON part from the generated text
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in AI response.");
      }
      parsedResponse = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsedResponse.milestones) || !Array.isArray(parsedResponse.achievements)) {
        throw new Error("Invalid AI response format: Expected 'milestones' and 'achievements' arrays.");
      }

      // Validate milestones
      if (!parsedResponse.milestones.every((m: any) => typeof m.goal === 'string' && typeof m.targetDays === 'number')) {
        throw new Error("Invalid AI response format for milestones: Expected objects with 'goal' (string) and 'targetDays' (number).");
      }

      // Validate achievements
      if (!parsedResponse.achievements.every((a: any) => typeof a.name === 'string' && typeof a.description === 'string' && typeof a.lucide_icon_name === 'string')) {
        throw new Error("Invalid AI response format for achievements: Expected objects with 'name' (string), 'description' (string), and 'lucide_icon_name' (string).");
      }

    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", generatedText, parseError);
      return new Response(JSON.stringify({ error: 'AI response could not be parsed. Please try a different goal or refine the prompt.', rawResponse: generatedText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const formattedMilestones = parsedResponse.milestones.map((m: any) => ({
      goal: m.goal,
      targetDays: m.targetDays,
      completedDays: 0,
      isCompleted: false,
    }));

    const formattedAchievements = parsedResponse.achievements.map((a: any) => {
      // Validate and fallback icon_name
      const iconName = VALID_LUCIDE_ICONS.includes(a.lucide_icon_name)
        ? a.lucide_icon_name
        : 'Award'; // Default to 'Award' if AI provides an invalid or empty icon name

      return {
        name: a.name,
        description: a.description,
        icon_name: iconName,
        is_unlocked: false, // Initially unlocked
        unlocked_at: null,
      };
    });

    return new Response(JSON.stringify({ milestones: formattedMilestones, achievements: formattedAchievements }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});