import Spinner from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
     <Spinner size={40} />
    </div>
  );
}
