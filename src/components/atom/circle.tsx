import { useEffect, useRef } from "react";
const Circle = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!wrapperRef.current) return;

    const [a, b, c] = ["#FF007E", "#00E5FF", "#FFD5FF"];

    wrapperRef.current.style.setProperty("--color-a", a);
    wrapperRef.current.style.setProperty("--color-b", b);
    wrapperRef.current.style.setProperty("--color-c", c);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto aspect-square w-[150px] max-w-[150px] overflow-hidden rounded-full bg-[#fff] p-8 text-white duration-500 ease-in [transition-property:_--color-a] 
      before:absolute before:inset-0 before:h-[105px] before:w-[105px] before:origin-center before:animate-blob before:rounded-full before:bg-gradient-to-r before:from-[--color-a] before:from-40% before:to-[--color-b] before:blur-[30px] before:brightness-125 
      after:absolute after:inset-0 after:h-[105px] after:w-[105px] after:origin-center after:animate-blob-reverse after:rounded-full after:bg-gradient-to-r after:from-[--color-a] after:from-40% after:to-[--color-b] after:blur-[30px] after:brightness-125"
    ></div>
  );
};

export default Circle;
