
import Image from "next/image";
interface SectionPubliciteProps {
  title: string;
  image: string;
}

export function SectionPublicite({ title, image }: SectionPubliciteProps) {
  return (
    <section className="w-full mb-10 ">
      <div className="relative rounded-2xl overflow-hidden bg-gray-300 h-60 cursor-pointer hover:opacity-95 transition-opacity">
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-2xl font-bold text-center px-4">
            {title}
          </h2>
        </div>
        <div className="absolute inset-0 ">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}