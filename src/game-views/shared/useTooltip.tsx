import "./Tooltip.css";
import cx from "classnames";
import React, { useRef, useEffect, FunctionComponent, ReactNode, useState, RefObject, useMemo, createContext, useContext, useCallback } from "react";
import * as ReactDOM from "react-dom";

export const useTooltip = (side: AnchorSide, children: ReactNode): [
    RefObject<HTMLElement>,
    ReactNode,
] => {
    const tooltip = useMemo(() => <Tooltip>{children}</Tooltip>, [children]);
    return useHoverLayer(side, tooltip);
};

const useHoverLayer = (side: AnchorSide, children: ReactNode): [
    RefObject<HTMLElement>,
    ReactNode,
] => {
    const anchorRef = useRef<HTMLElement>(null);
    const [maybeLayer, mount, maybeUnmount] = useAnchoredLayer();

    useEffect(() => {
        const handleMouseEnter = (event: MouseEvent) => mount(event.target as Element, side, children);
        const handleMouseLeave = (event: MouseEvent) => maybeUnmount();
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
    }, [mount, maybeUnmount, children, side]);

    return [anchorRef, maybeLayer];
};

export const useAnchoredLayer = (): [
    ReactNode,
    (anchorNode: Element, side: AnchorSide, children: ReactNode) => void,
    () => void,
] => {
    const [maybeLayer, setLayer] = useState<ReactNode>(null);
    const container = useRef<HTMLDivElement | null>(null);

    const mount = useCallback((anchorNode: Element, side: AnchorSide, children: ReactNode) => {
        container.current = document.createElement("div");
        document.body.appendChild(container.current);
        setLayer(
            ReactDOM.createPortal(
                <AnchoredLayer anchorNode={anchorNode} side={side}>
                    {children}
                </AnchoredLayer>,
                container.current
            )
        );
    }, []);
    const maybeUnmount = useCallback(() => {
        if (container.current) {
            setLayer(null);
            document.body.removeChild(container.current);
            container.current = null;
        }
    }, []);
    return [maybeLayer, mount, maybeUnmount];
};

const LayerSideContext = createContext<AnchorSide>("bottom");

export type AnchorSide = "top" | "right" | "bottom" | "left";
const AnchoredLayer: FunctionComponent<{
    anchorNode: Element;
    side: AnchorSide;
}> = ({ anchorNode, side, children, }) => {
    const anchorRect = anchorNode.getBoundingClientRect();

    return <div
        className="AnchoredLayer"
        style={{
            left: side === "top" || side === "bottom"
                ? (anchorRect.left + anchorRect.right) / 2
                : side === "left" ? anchorRect.left : anchorRect.right,
            top: side === "left" || side === "right"
                ? (anchorRect.top + anchorRect.bottom) / 2
                : side === "top" ? anchorRect.top : anchorRect.bottom,
        }}
    >
        <LayerSideContext.Provider value={side}>
            {children}
        </LayerSideContext.Provider>
    </div>;
};

export const Tooltip: FunctionComponent<{}> = ({ children, }) => {
    const side = useContext(LayerSideContext);

    return <div className={cx("Tooltip", `Tooltip--${side}`)}>
        {children}
    </div>;
};
