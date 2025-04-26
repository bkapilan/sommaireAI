'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { NavigationControls } from "./navigation-controls";
import ProgressBar from "./progress-bar";
import { parseSection } from "@/utils/summary-helper";
import ContentSection from "./content-section";

const SectionTitle = ({ title }: { title: string }) => {
    return (
        <div className="flex flex-col gap-2 mb-6 sticky top-0
        pt-2 pb-4 bg-background/80 backdrop-blur-xs z-10">
            <h2 className="text-3xl lg:text-4xl font-bold
            text-center flex items-center justify-center gap-2">
                {title}
            </h2>
        </div>
    );
};

export function SummaryViewer({ summary }: { summary: string }) {
    const [currentSection, setCurrentSection] = useState(0);

    const handleNext = () => setCurrentSection((prev) => Math.
    min(prev + 1, sections.length -1));

    const handlePrevious = () => setCurrentSection((prev) => Math.
    min(prev - 1, 0));

    // const handleSectionSelect = (index: number) =>
    //     setCurrentSection(Math.min(Math.max(index, 0), sections.length - 1));

    //parseSummary

    const sections = summary
        .split('\n#')
        .map((section) =>section.trim())
        .filter(Boolean)
        .map(parseSection);

    // console.log(sections);

    return (
        <Card className="relative px-2 h-[500px] sm:h-[600px] lg:h-[700px]
        w-full xl:w-[600px] overflow-hidden bg-linear-to-br from-background
        via-background/95 to-rose-500/5 backdrop-blur-lg shadow-2xl rounded-3xl
        border border-rose-500/10">
            <ProgressBar 
                sections={sections}
                currentSection={currentSection}
            />
            <div className="h-full overflow-y-auto scrollbar-hide
            pt-12 sm:pt-16 pb-20 sm:pb-24">
                <div className="px-4 sm:px-6">
                    <SectionTitle title={sections[currentSection]?.title || ''} />
                    <ContentSection
                        title={sections[currentSection]?.title || ''}
                        points={sections[currentSection]?.points || []}
                    />
                    {/* <ul>
                        {sections[currentSection]?.points.map((point,
                            index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul> */}
                </div>
            </div>


            <NavigationControls
                currentSection={currentSection}
                totalSections={sections.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSectionSelect={setCurrentSection}
            />
    </Card>
    )
}


