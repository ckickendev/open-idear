export interface SeriesInterface {
  _id: string;
  description: string;
  image: { url: string; description: string };
  user: { name: string; username: string }
  slug: string;
  title: string;
}