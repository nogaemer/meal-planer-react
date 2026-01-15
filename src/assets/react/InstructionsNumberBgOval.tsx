/**
 * SVG component displaying a rotated oval/diamond shape used as a background for instruction numbers
 */
import React from "react";

interface InstructionsNumberBgOvalProps extends React.SVGProps<SVGSVGElement> {
    /** Size of the SVG in pixels or CSS unit (width and height) */
    size?: number | string;
}

/**
 * Renders an oval/diamond-shaped background for instruction step numbers.
 * Uses CSS custom property `--color-accent` for fill color.
 * 
 * @param size - Size dimension for width and height (default: 64)
 * @param props - Additional SVG element properties
 */
const InstructionsNumberBgOval: React.FC<InstructionsNumberBgOvalProps> = ({ size = 64, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M19.5563 12.0902C28.4904 3.15604 42.9756 3.15604 51.9098 12.0902C60.844 21.0244 60.844 35.5096 51.9098 44.4438L44.4436 51.91C35.5094 60.8442 21.0242 60.8442 12.09 51.91C3.15586 42.9758 3.15586 28.4906 12.09 19.5564L19.5563 12.0902Z"
            fill="var(--color-accent)"/>
    </svg>
);

export default InstructionsNumberBgOval;
