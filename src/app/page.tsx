"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import OpenAI from "openai";
import jsPDF from "jspdf";

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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Split the output text into lines that fit the PDF width
    const lines = doc.splitTextToSize(output, 180); // 180 is the max width in points

    // Add title
    doc.setFontSize(16);
    doc.text("Generated Screenplay", 105, 15, { align: "center" });

    // Add content
    doc.setFontSize(12);
    doc.text(lines, 15, 25); // Start content at x:15, y:25

    // Save the PDF
    doc.save("screenplay.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-gray-800">
          Screenplay Generator
        </h1>

        {/* Change flex to flex-col on mobile, row on larger screens */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-12rem)]">
          {/* Left Panel */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">
              Story Draft
            </h2>
            <Textarea
              className="flex-1 resize-none min-h-[200px] lg:min-h-0"
              placeholder="Write your story draft here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Center Panel - Hide arrows on mobile */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-4">
            <ArrowRight className="w-8 h-8 text-blue-500" />
            <Button
              className="px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold whitespace-nowrap"
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

          {/* Mobile Generate Button */}
          <div className="lg:hidden flex justify-center">
            <Button
              className="px-4 py-4 text-base font-semibold w-full sm:w-auto"
              onClick={handleGenerate}
              disabled={isLoading || isTyping}
            >
              {isLoading
                ? "Generating..."
                : isTyping
                ? "Typing..."
                : "Generate"}
            </Button>
          </div>

          {/* Right Panel */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
                Generated Screenplay
              </h2>
              {output && !isLoading && !isTyping && (
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M12 17v-6" />
                    <path d="M9.5 14.5L12 17l2.5-2.5" />
                  </svg>
                  Export PDF
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center min-h-[200px] lg:min-h-0">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Textarea
                className="flex-1 resize-none min-h-[200px] lg:min-h-0"
                placeholder="Your generated screenplay will appear here..."
                value={output}
                readOnly
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 sm:mt-8 text-center text-gray-600">
        <p className="text-xs sm:text-sm">
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
