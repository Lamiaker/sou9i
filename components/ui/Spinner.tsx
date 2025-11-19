export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-block border-2 border-gray-600 border-t-transparent rounded-full animate-spin"
    ></span>
  );
}
