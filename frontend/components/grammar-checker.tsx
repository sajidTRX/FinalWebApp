"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Check, RefreshCcw, BarChart2, Zap } from "lucide-react"

interface GrammarCheckerProps {
  text: string
  onApplyFix: (fixedText: string) => void
}

interface GrammarIssue {
  type: "grammar" | "style" | "clarity"
  severity: "low" | "medium" | "high"
  original: string
  suggestion: string
  explanation: string
  startIndex: number
  endIndex: number
}

export default function GrammarChecker({ text, onApplyFix }: GrammarCheckerProps) {
  const [issues, setIssues] = useState<GrammarIssue[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [stats, setStats] = useState({
    readability: "Good",
    readingTime: "2 min",
    passiveVoice: "12%",
    wordVariety: "High",
    sentenceLength: "Medium",
  })
  const [fixedText, setFixedText] = useState(text)

  // Mock grammar check on component mount
  useEffect(() => {
    checkGrammar()
  }, [])

  const checkGrammar = () => {
    setIsChecking(true)

    // Simulate grammar check delay
    setTimeout(() => {
      // Mock grammar issues
      setIssues([
        {
          type: "grammar",
          severity: "high",
          original: "It was raining again.",
          suggestion: "It was raining again,",
          explanation: "Consider adding a comma to connect the two related clauses.",
          startIndex: 0,
          endIndex: 19,
        },
        {
          type: "style",
          severity: "medium",
          original: "reminded him of",
          suggestion: "evoked memories of",
          explanation: "Consider a more evocative verb to strengthen the imagery.",
          startIndex: 20,
          endIndex: 34,
        },
        {
          type: "clarity",
          severity: "low",
          original: "...",
          suggestion: "distant echoes from his past.",
          explanation: "Replace ellipsis with a more descriptive ending to engage readers.",
          startIndex: 34,
          endIndex: 37,
        },
      ])

      setFixedText("It was raining again, the sound evoked memories of distant echoes from his past.")

      setIsChecking(false)
    }, 1000)
  }

  const applySingleFix = (issue: GrammarIssue) => {
    const newText = text.substring(0, issue.startIndex) + issue.suggestion + text.substring(issue.endIndex)
    setFixedText(newText)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-[#3d3225]"
      case "medium":
        return "text-[#4a3f32]"
      case "low":
        return "text-[#6b5d4d]"
      default:
        return "text-[#4a3f32]"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grammar":
        return <AlertTriangle className="h-4 w-4" />
      case "style":
        return <BarChart2 className="h-4 w-4" />
      case "clarity":
        return <Zap className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <Tabs defaultValue="issues">
      <TabsList className="grid w-full grid-cols-2 bg-[#d4c4a8]">
        <TabsTrigger value="issues" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">Issues</TabsTrigger>
        <TabsTrigger value="stats" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">Style Stats</TabsTrigger>
      </TabsList>

      <TabsContent value="issues" className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#3d3225]">Grammar & Style Issues</h3>
          <Button variant="ghost" size="sm" onClick={checkGrammar} disabled={isChecking} className="text-[#4a3f32] hover:bg-[#e8ddd0]">
            <RefreshCcw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isChecking ? (
          <div className="space-y-2">
            <div className="h-20 animate-pulse rounded-md bg-[#d4c4a8]"></div>
            <div className="h-20 animate-pulse rounded-md bg-[#d4c4a8]"></div>
          </div>
        ) : issues.length > 0 ? (
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`rounded-md border-l-2 bg-[#f5f0e8] p-3 ${
                  issue.severity === "high"
                    ? "border-[#3d3225]"
                    : issue.severity === "medium"
                      ? "border-[#6b5d4d]"
                      : "border-[#a89880]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {getTypeIcon(issue.type)}
                    <span className={`ml-2 font-medium capitalize ${getSeverityColor(issue.severity)}`}>
                      {issue.type}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => applySingleFix(issue)} className="text-[#4a3f32] hover:bg-[#e8ddd0]">
                    Apply
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-[#5a4a3a]">
                    <span className="line-through">{issue.original}</span>
                    {" → "}
                    <span className="font-medium text-[#3d3225]">{issue.suggestion}</span>
                  </p>
                  <p className="mt-1 text-xs text-[#6b5d4d]">{issue.explanation}</p>
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-md bg-[#e8ddd0] p-3">
              <h4 className="text-sm font-medium text-[#3d3225]">Preview with all fixes applied:</h4>
              <p className="mt-2 text-[#3d3225]">{fixedText}</p>
              <Button className="mt-3 w-full bg-[#4a3f32] text-[#efe6d5] hover:bg-[#3d3225]" onClick={() => onApplyFix(fixedText)}>
                <Check className="mr-2 h-4 w-4" />
                Apply All Fixes
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-[#f5f0e8] p-4 text-center">
            <Check className="mx-auto h-6 w-6 text-[#6b5d4d]" />
            <p className="mt-2 text-[#5a4a3a]">No issues found in your text.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="stats" className="space-y-4 py-4">
        <h3 className="text-sm font-medium text-[#3d3225]">Writing Style Analysis</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md bg-[#f5f0e8] p-3">
            <span className="text-sm text-[#5a4a3a]">Readability</span>
            <span className="font-medium text-[#3d3225]">{stats.readability}</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#f5f0e8] p-3">
            <span className="text-sm text-[#5a4a3a]">Estimated Reading Time</span>
            <span className="font-medium text-[#3d3225]">{stats.readingTime}</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#f5f0e8] p-3">
            <span className="text-sm text-[#5a4a3a]">Passive Voice</span>
            <span className="font-medium text-[#3d3225]">{stats.passiveVoice}</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#f5f0e8] p-3">
            <span className="text-sm text-[#5a4a3a]">Word Variety</span>
            <span className="font-medium text-[#3d3225]">{stats.wordVariety}</span>
          </div>

          <div className="flex items-center justify-between rounded-md bg-[#f5f0e8] p-3">
            <span className="text-sm text-[#5a4a3a]">Average Sentence Length</span>
            <span className="font-medium text-[#3d3225]">{stats.sentenceLength}</span>
          </div>
        </div>

        <div className="rounded-md bg-[#e8ddd0] p-3">
          <h4 className="text-xs font-medium text-[#3d3225]">Style Suggestions</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[#5a4a3a]">
            <li>Consider varying sentence length for better rhythm</li>
            <li>Your vocabulary diversity is good, maintaining reader interest</li>
            <li>The text has a consistent tone appropriate for fiction</li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  )
}
