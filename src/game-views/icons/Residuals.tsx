import cx from "classnames";
import * as React from "react";
import "./Residuals.css";

interface Props {
    children?: number | string;
    className?: string;
}

const Residuals: React.FunctionComponent<Props> = props => {
    return <span className={cx("Residuals", props.className)}>
        <span className="Residuals-amount">
            {props.children}
        </span>
        <ResidualsArrow />
    </span>;
};

export default Residuals;

const ResidualsArrow: React.FunctionComponent = () => {
    return <svg
        className="ResidualsArrow"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 612.268 612.268" >
        <path d="M593.011,382.796H401.785c-10.556,0-19.123,8.567-19.123,19.123s10.001,17.937,18.167,26.083l53.142,53.142
            c-39.909,33.848-91.387,54.462-147.837,54.462c-113.665,0-207.786-82.744-226.029-191.227H2.811
            c18.855,150.878,147.32,267.717,303.323,267.717c77.58,0,148.296-28.99,202.164-76.624l54.786,54.786
            c10.308,10.307,19.371,22.01,29.927,22.01s19.123-8.567,19.123-19.123V401.919C612.134,399.605,612.134,382.796,593.011,382.796z
                M19.256,229.471h191.226c10.556,0,19.123-8.567,19.123-19.123s-10.001-17.937-18.167-26.083l-53.142-53.142
            c39.909-33.847,91.387-54.461,147.837-54.461c113.665,0,207.786,82.744,226.029,191.226h77.293
            C590.602,117.011,462.136,0.172,306.134,0.172c-77.581,0-148.296,28.99-202.164,76.625L49.183,22.01
            C38.876,11.703,29.812,0,19.256,0S0.134,8.567,0.134,19.123v191.226C0.134,212.663,0.134,229.471,19.256,229.471z"/>
    </svg>;
};
