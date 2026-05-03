import { InventoryProvider } from "@/context/low-stock-context"

export default function InventoryLayout({ children, clientId }: { children: React.ReactNode, clientId: string }) {
    return (
        <div>
            <InventoryProvider clientId={clientId}>{children}</InventoryProvider>
        </div>
    )
}