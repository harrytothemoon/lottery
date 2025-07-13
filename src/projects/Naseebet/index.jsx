import LuckyDraw from '../../LuckyDraw';
import useFavicon from '../../hooks/index';

const Naseebet = () => {
  useFavicon();
  return (
    <LuckyDraw
      defaultTheme="green"
      backgroundImageUrl={`url("${process.env.PUBLIC_URL}/naseebet/background.jpeg")`}
      LogoUrl={`${process.env.PUBLIC_URL}/naseebet/logo.jpeg`}
    />
  );
};

export default Naseebet;
