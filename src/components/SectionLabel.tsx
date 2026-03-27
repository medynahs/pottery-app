import { Text } from '@/src/components/ui/text';
import React from 'react';

interface SectionLabelProps {
    title: string;
}

export const SectionLabel = React.memo(function SectionLabel({ title }: SectionLabelProps) {
    return (
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-6">
            {title}
        </Text>
    );
});

