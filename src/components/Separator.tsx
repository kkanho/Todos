import React from "react";

interface SeperatorProps extends Omit<React.HTMLProps<HTMLDivElement>, "tab"> {
    tab: string;
} 

const Separator = ({tab, ...props}: SeperatorProps) => {
    return (
        <div className="separator text-gray-400 flex gap-1 align-middle translate-y-2" {...props}>
            <div className="h-[1px] w-full bg-gray-400 left-1/2 self-center"></div>
                {tab}
            <div className="h-[1px] w-full bg-gray-400 left-1/2 self-center"></div>
        </div>
    );
};

export default Separator;
