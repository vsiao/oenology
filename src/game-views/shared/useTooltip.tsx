import "./Tooltip.css";
import React, { useRef, useEffect, FunctionComponent, ReactNode, useState, RefObject, useMemo } from "react";
import * as ReactDOM from "react-dom";

export const useTooltip = (side: AnchorSide, children: ReactNode): [
    RefObject<HTMLElement>,
    ReactNode,
] => {
    const tooltip = useMemo(() => <Tooltip side={side}>{children}</Tooltip>, [side, children]);
    return useAnchoredLayer(side, tooltip);
};

const useAnchoredLayer = (side: AnchorSide, children: ReactNode): [
    RefObject<HTMLElement>,
    ReactNode,
] => {
    const anchorRef = useRef<HTMLElement>(null);
    const [maybeLayer, setLayer] = useState<ReactNode>(null);

    useEffect(() => {
        let container: HTMLDivElement | null = null;
        const maybeUnmount = () => {
            if (container) {
                document.body.removeChild(container);
                container = null;
            }
        };
        const handleMouseEnter = (event: MouseEvent) => {
            container = document.createElement("div");
            document.body.appendChild(container);
            setLayer(
                ReactDOM.createPortal(
                    <AnchoredLayer anchorNode={event.target as Element} side={side}>
                        {children}
                    </AnchoredLayer>,
                    container
                )
            );
        };
        const handleMouseLeave = (event: MouseEvent) => {
            setLayer(null);
            maybeUnmount();
        };
        if (anchorRef.current) {
            const anchorNode = anchorRef.current;
            anchorNode.addEventListener("mouseenter", handleMouseEnter);
            anchorNode.addEventListener("mouseleave", handleMouseLeave);

            return () => {
                anchorNode.removeEventListener("mouseenter", handleMouseEnter);
                anchorNode.removeEventListener("mouseleave", handleMouseLeave);
                maybeUnmount();
            };
        }
    }, [children, side]);

    return [anchorRef, maybeLayer];
};

type AnchorSide = "top" | "right" | "bottom" | "left";
const AnchoredLayer: FunctionComponent<{
    anchorNode: Element;
    side: AnchorSide;
}> = ({ anchorNode, side, children, }) => {
    const anchorRect = anchorNode.getBoundingClientRect();

    return <div
        className="AnchoredLayer"
        style={{
            left: (anchorRect.left + anchorRect.right) / 2,
            top: anchorRect.top,
        }}
    >
        {children}
    </div>;
};

const Tooltip: FunctionComponent<{
    side: AnchorSide;
}> = ({ side, children, }) => {
    return <div className="Tooltip">
        {children}
    </div>;
};
