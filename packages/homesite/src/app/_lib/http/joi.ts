import Joi from 'joi';

const joiScale = Joi.object({
  x1: Joi.number().required(),
  y1: Joi.number().required(),
  x2: Joi.number().required(),
  y2: Joi.number().required(),
  width: Joi.number().required(),
  height: Joi.number().required(),
  pageNumber: Joi.number(),
});

export const joiScaledPosition = Joi.object({
  boundingRect: joiScale.required(),
  rects: Joi.array().items(joiScale).required(),
  pageNumber: Joi.number().required(),
  usePdfCoordinates: Joi.boolean(),
});

export const joiContent = Joi.object({
  text: Joi.string(),
  image: Joi.string(),
});

export const joiHighlight = Joi.object({
  url: Joi.string().required(),
  content: joiContent.required(),
  position: joiScaledPosition.required(),
  comment: Joi.object({
    text: Joi.string().required(),
  }).allow(null),
  backgroundColor: Joi.string().allow(null),
  privacy: Joi.boolean().allow(null),
});

export const joiCoord = Joi.object({
  x: Joi.number().required(),
  y: Joi.number().required(),
});

export const joiScaledStrokePosition = Joi.object({
  boundingRect: joiScale.required(),
  path: Joi.object({
    coords: Joi.array().items(joiCoord).required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
  }),
  pageNumber: Joi.number().required(),
  usePdfCoordinates: Joi.boolean().allow(null),
});

export const joiStroke = Joi.object({
  url: Joi.string().required(),
  position: joiScaledStrokePosition.required(),
  color: Joi.string().allow(null),
  privacy: Joi.boolean().allow(null),
  strokeWidth: Joi.number().required(),
});
