"use client"

import type React from "react"

import { useState } from "react"
import { Info, Keyboard, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Feature {
  title: string
  description: string
  shortcut?: string
  icon: React.ReactNode
  isNew?: boolean
}

interface FeaturePanelProps {
  features: {
    category: string
    items: Feature[]
  }[]
  mode: string
}

export default function FeaturePanel({ features, mode }: FeaturePanelProps) {
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (title: string) => {
    if (favorites.includes(title)) {
      setFavorites(favorites.filter((fav) => fav !== title))
    } else {
      setFavorites([...favorites, title])
    }
  }

  return (
    <div className="h-full w-72 border-l border-[#a89880] bg-[#f5f0e8] overflow-y-auto">
      <div className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-[#3d3225]">{mode} Features</h3>

        {favorites.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 flex items-center text-sm font-medium text-[#4a3f32]">
              <Star className="mr-1 h-4 w-4 text-yellow-600" /> Favorites
            </h4>
            <div className="space-y-2">
              {features
                .flatMap((category) => category.items.filter((item) => favorites.includes(item.title)))
                .map((feature, index) => (
                  <div key={index} className="rounded-lg bg-[#efe6d5] border border-[#a89880] shadow-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {feature.icon}
                        <span className="ml-2 text-sm font-medium text-[#3d3225]">{feature.title}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-[#e8ddd0]"
                              onClick={() => toggleFavorite(feature.title)}
                            >
                              <Star className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove from favorites</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {feature.shortcut && (
                      <div className="mt-1 flex items-center text-xs text-[#6b5d4d]">
                        <Keyboard className="mr-1 h-3 w-3" />
                        <span>{feature.shortcut}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <Accordion type="multiple" className="w-full">
          {features.map((category, index) => (
            <AccordionItem key={index} value={`category-${index}`} className="border-b border-[#a89880]">
              <AccordionTrigger className="text-sm font-medium text-[#4a3f32] py-2">
                {category.category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {category.items.map((feature, featureIndex) => (
                    <div key={featureIndex} className="rounded-lg bg-[#efe6d5] border border-[#a89880] shadow-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {feature.icon}
                          <span className="ml-2 text-sm font-medium text-[#3d3225]">{feature.title}</span>
                          {feature.isNew && (
                            <span className="ml-2 rounded-full bg-[#d4c4a8] px-2 py-0.5 text-xs font-medium text-[#3d3225]">
                              New
                            </span>
                          )}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-[#e8ddd0]"
                                onClick={() => toggleFavorite(feature.title)}
                              >
                                <Star
                                  className={`h-3 w-3 ${favorites.includes(feature.title) ? "fill-yellow-600 text-yellow-600" : "text-[#a89880]"}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{favorites.includes(feature.title) ? "Remove from favorites" : "Add to favorites"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="mt-1 text-xs text-[#5a4a3a]">{feature.description}</p>
                      {feature.shortcut && (
                        <div className="mt-1 flex items-center text-xs text-[#6b5d4d]">
                          <Keyboard className="mr-1 h-3 w-3" />
                          <span>{feature.shortcut}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-4 rounded-lg bg-[#e8ddd0] p-4 shadow-md">
          <h4 className="flex items-center text-xs font-medium text-[#4a3f32]">
            <Info className="mr-1 h-3 w-3" /> Tips
          </h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[#5a4a3a]">
            <li>Star features to add them to your favorites</li>
            <li>Use keyboard shortcuts for faster access</li>
            <li>Press '?' anytime for keyboard shortcuts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
