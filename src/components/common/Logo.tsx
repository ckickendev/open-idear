const Logo = ({className}: any) => {
  return (
    <>
      <img
        src={process.env.NEXT_PUBLIC_CLOUDINARY_LOGO_URL}
        alt="logo OpenIdear"
        className={ "w-[30px] " + className }
      />
    </>
  );
};

export default Logo;
