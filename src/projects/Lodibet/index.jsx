import LuckyDraw from "../../LuckyDraw";
import useFavicon from "../../hooks/index";

const Lodibet = () => {
  useFavicon();
  return (
    <LuckyDraw
      defaultTheme="dark"
      backgroundImageUrl={`url("${process.env.PUBLIC_URL}/lodibet/background.jpeg")`}
      LogoUrl={`${process.env.PUBLIC_URL}/lodibet/logo.jpeg`}
    />
  );
};

export default Lodibet;
