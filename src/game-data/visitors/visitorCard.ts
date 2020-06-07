import * as React from "react";

export interface VisitorCardData {
    name: string;
    description: React.ReactNode;
}

export const visitorCard = (
    name: string,
    description: React.ReactNode,
): VisitorCardData => {
    return { name, description, };
};
