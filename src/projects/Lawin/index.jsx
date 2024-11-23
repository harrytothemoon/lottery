import LuckyDraw from "../../LuckyDraw";
import useFavicon from "../../hooks/index";

const Lodibet = () => {
  useFavicon();
  return (
    <LuckyDraw
      defaultTheme="blue"
      backgroundImageUrl={`url("${process.env.PUBLIC_URL}/lawin/background.jpeg")`}
      LogoUrl={`${process.env.PUBLIC_URL}/lawin/logo.jpeg`}
    />
  );
};

export default Lodibet;
