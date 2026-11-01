import { cn } from "@/lib/utils";

const Logo = ({ className, size, ...props }: any) => {
  return (
    <img
      src={
        process.env.NEXT_PUBLIC_CLOUDINARY_LOGO_URL ||
        "https://res.cloudinary.com/dhc6z8uix/image/upload/v1743690388/wik95ksifmrudkbfmzom.png"
      }
      alt="logo OpenIdear"
      className={cn("w-[30px] object-contain", className)}
      style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
      {...props}
    />
  );
};

export default Logo;

