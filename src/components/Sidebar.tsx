'use client';

import { BrickWall, CalendarArrowUp, CircleDollarSign, Cog, LayoutDashboard, LucideIcon, Menu, NotebookPen, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState } from 'react';

interface sideBarInterface {
  image: LucideIcon,
  link: string,
  title: string
};

const itensSidebar: sideBarInterface[] = [
  {
    image: LayoutDashboard,
    link: "/",
    title: 'Dashboard'
  },
  
  {
    image: Workflow,
    link: "/obras",
    title: 'Obras'
  },

  {
    image: BrickWall,
    link: "/materias",
    title: 'materias'
  },

  {
    image: CircleDollarSign,
    link: "/orcamento",
    title: 'orçamento'
  },

  {
    image: CalendarArrowUp,
    link: "/pedidos",
    title: 'pedidos'
  },

  {
    image: NotebookPen,
    link: "/diario",
    title: 'diario'
  },

  {
    image: Cog,
    link: "/configuracao",
    title: 'configuração'
  },
];

export default function Sidebar(){

  const [ isMenuOpen, setIsMenuOpen ] = useState(true);

  const pathname = usePathname();

    return (
      <div className={`relative z-10 transition-all duration-300 ease-in-out flex shrink-0 ${isMenuOpen ? "w-64" : "w-20"}`}>
        <div className="h-full w-full bg-[#1e1e1e] p-4 flex flex-col border-[#2f2f2f]">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-2 rounded-full hover:bg-[#2f2f2f] transition-colors max-w-fit cursor-pointer"
          >
            <Menu size={24}/>
          </button>
          <nav className="mt-8 flex flex-col grow gap-5">
            {
              itensSidebar.map((item) => {
                const ItensComponents = item.image
                return (
                  <Link key={item.link} href={item.link}>
                    <div className={`flex items-center text-sm font-bold rounded-lg p-4 hover:bg-[#2f2f2f] 
                      ${pathname === item.link ? 'bg-[#2f2f2f]': ''}`}>
                        <ItensComponents size={20} style={{ minWidth: "20px" }}/>
                        { isMenuOpen && (
                          <span className="ml-4 whitespace-nowrap">{item.title}</span>
                        )}
                    </div>
                  </Link>
                )
              })
            }
          </nav>
        </div>
      </div>
    )
}