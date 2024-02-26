import {
  Content,
  ScaledPosition,
  Comment,
} from "components/react-pdf-highlighter/types";
import { Highlight, User } from "./types";

type Overwrite<Base, Overrides> = Omit<Base, keyof Overrides> & Overrides;

export type HighlightType = Overwrite<
  Highlight,
  {
    id: Highlight["id"]["__select__"];
    content: Content;
    position: ScaledPosition;
    comment: Comment | null;
  }
>;

export type SimplifiedUser = Overwrite<
  Pick<User, "id" | "name" | "image">,
  { id: User["id"]["__select__"] }
>;
