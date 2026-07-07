import Link from "next/link";

export default function Header() {
    const date = new Date();
    return (
        <header className="bg-[#1e1e1e] mx-4 sm:mx-6 lg:mx-8 mt-4 mb-2 rounded-lg">
            <div className="max-w-7xl mx-auto py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between">
                <h1 className="mb-4 sm:mb-0 font-bold text-lg">DashBoard</h1>

                <div 
                    className="flex justify-around sm:justify-center w-full sm:w-auto items-center spa-x-3 sm:space-x-6"
                >
                    <p className="text-gray-400 font-bold">
                        {`${date.toLocaleDateString('pt-br', {month: 'long'})} ${date.getFullYear()}`}
                    </p>

                    <button className="border py-2 px-8 rounded-[14px] font-bold text-lg cursor-pointer hover:bg-gray-950">
                        <Link href={"/formulario"}>+Nova obra</Link>
                    </button>
                </div>
            </div>
        </header>
    );
};