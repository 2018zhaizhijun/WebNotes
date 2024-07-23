import {
  Comment,
  Content,
  ScaledPosition,
  ScaledStrokePosition,
} from 'components/react-pdf-highlighter/types';
import { Highlight, Stroke, User } from './types';

export type Overwrite<Base, Overrides> = Omit<Base, keyof Overrides> &
  Overrides;

export type HighlightType = Overwrite<
  Highlight,
  {
    id: Highlight['id']['__select__'];
    content: Content;
    position: ScaledPosition;
    comment: Comment | null;
  }
>;

export type SimplifiedUser = Overwrite<
  Pick<User, 'id' | 'name' | 'image'>,
  { id: User['id']['__select__']; name: User['name']['__select__'] }
>;

export type StrokeType = Overwrite<
  Stroke,
  {
    id: Stroke['id']['__select__'];
    position: ScaledStrokePosition;
  }
>;
