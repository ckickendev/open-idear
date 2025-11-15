const Logo = ({className}: any) => {
  return (
    <>
      <img
        src={process.env.NEXT_CLOUDINARY_LOGO_URL}
        alt="logo for whole website OpenIdear"
        className={ "w-[30px] " + className }
      />
    </>
  );
};

export default Logo;
