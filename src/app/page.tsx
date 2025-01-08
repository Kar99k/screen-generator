"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import OpenAI from "openai";

export default function ScreenplayGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const animateText = async (text: string) => {
    setIsTyping(true);
    setOutput("");

    for (let i = 0; i < text.length; i++) {
      setOutput((prev) => prev + text.charAt(i));
      // Adjust the timeout value (in ms) to control typing speed
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setIsTyping(false);
  };

  const handleGenerate = async () => {
    try {
      setIsLoading(true);

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              'You are a screenwriting assistant. Always format the output as a properly formatted screenplay. Follow these guidelines:\n\nScene Headings: Write scene headings in uppercase. Use the format: [INT./EXT.] [LOCATION] - [TIME OF DAY].\n\nExample: INT. SUBURBAN HOME - NIGHT.\nAction Lines: Use present tense to describe actions. Write them as plain sentences, starting on a new line without indentation.\n\nCharacter Names: Center the character names in uppercase before their dialogue.\n\nDialogue: Write the dialogue beneath the character\'s name, aligned slightly to the left. Do not add quotation marks.\n\nParentheticals: Add parentheticals (e.g., emotions or actions) below character names, indented slightly before the dialogue.\n\nTransitions: Write transitions in uppercase, aligned to the right.\n\nExample: CUT TO: or FADE OUT.\nNumbering: Start with "FADE IN:" at the top and "FADE OUT." at the end. Add scene numbers at the left margin for each new scene.',
          },
          {
            role: "user",
            content: input,
          },
        ],
      });

      const generatedText =
        response.choices[0].message.content || "No response generated";
      setIsLoading(false);

      // Animate the text instead of setting it directly
      await animateText(generatedText);
    } catch (error) {
      console.error("Error:", error);
      setOutput("Error generating screenplay. Please try again.");
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Screenplay Generator
        </h1>
        <div className="flex gap-4 h-[calc(100vh-12rem)]">
          {/* Left Panel */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Story Draft
            </h2>
            <Textarea
              className="flex-1 resize-none"
              placeholder="Write your story draft here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Center Panel */}
          <div className="flex flex-col items-center justify-center gap-4">
            <ArrowRight className="w-8 h-8 text-blue-500" />
            <Button
              className="px-8 py-6 text-lg font-semibold"
              onClick={handleGenerate}
              disabled={isLoading || isTyping}
            >
              {isLoading
                ? "Generating..."
                : isTyping
                ? "Typing..."
                : "Generate"}
            </Button>
            <ArrowRight className="w-8 h-8 text-blue-500" />
          </div>

          {/* Right Panel */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Generated Screenplay
            </h2>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Textarea
                className="flex-1 resize-none"
                placeholder="Your generated screenplay will appear here..."
                value={output}
                readOnly
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-600">
        <p className="text-sm">
          Created with ❤️ by{" "}
          <a
            href="https://github.com/Thanish-Kumar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Thanish
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/Kar99k"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Karkey
          </a>
        </p>
      </footer>
    </div>
  );
}
