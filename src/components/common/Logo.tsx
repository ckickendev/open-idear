import { cn } from "@/lib/utils";

const Logo = ({ className, size, ...props }: any) => {
  return (
    <img
      src={process.env.NEXT_PUBLIC_CLOUDINARY_LOGO_URL}
      alt="logo OpenIdear"
      className={cn("w-[30px]", className)}
      style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
      {...props}
    />
  );
};

export default Logo;

