import { GeminiStudio } from '@/app/components/gemini-studio';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
            <div className="flex items-center gap-2">
                 <Image
                    src="https://firebasestorage.googleapis.com/v0/b/marketplan-canvas.firebasestorage.app/o/Sj%C3%A6llandske_Nyheder_Bred_RGB_ny.png?alt=media&token=a37e81ab-1d4b-4913-bab2-c35a5fda6056"
                    alt="Sjællandske Medier logo"
                    width={150}
                    height={37}
                    priority
                />
                <SidebarTrigger className="ml-auto" />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <Button variant="outline" className='w-full justify-start'>
                <Plus className="mr-2 h-4 w-4" />
                Ny samtale
            </Button>
            <div className='flex-1 mt-4'>
                <p className='text-sm text-muted-foreground px-2'>Historik</p>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Tidligere samtale 1" isActive>
                            Tidligere samtale 1
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Tidligere samtale 2">
                            Tidligere samtale 2
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <GeminiStudio />
      </SidebarInset>
    </div>
  );
}
