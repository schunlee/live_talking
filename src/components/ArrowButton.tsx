import { Tooltip } from "@/components/ui/tooltip"


interface ArrowButtonProps {
    togglePanel: () => void;
    direction: string

}


const ArrowButton = ({ direction, togglePanel }: ArrowButtonProps) => {
    return (
        <Tooltip showArrow content="Extend/Fold the ChatBox">
            <button
                onClick={togglePanel}
                className="
    absolute right-2 top-1/2 -translate-y-1/2
    w-12 h-12 rounded-full 
    bg-gradient-to-r from-gray-800 to-gray-900
    shadow-lg shadow-gray-500/40
    flex items-center justify-center
    text-white text-2xl font-bold
    border-2 border-white
    transition-all duration-300
    hover:scale-110 hover:shadow-gray-700/70 hover:from-black hover:to-gray-800
  ">
                {direction === "LEFT" && <span className="transform rotate-270">^</span>}
                {direction === "RIGHT" && <span className="transform rotate-90">^</span>}

            </button>
        </Tooltip>
    )
}

export default ArrowButton