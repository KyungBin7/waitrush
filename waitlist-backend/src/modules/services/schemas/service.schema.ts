import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({
  timestamps: true,
  collection: 'services',
})
export class Service {
  @Prop({ type: Types.ObjectId, ref: 'Organizer', required: true, index: true })
  organizerId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop()
  waitlistTitle?: string;

  @Prop()
  waitlistDescription?: string;

  @Prop()
  waitlistBackground?: string;

  // Separated image fields
  @Prop()
  iconImage?: string; // For service icon/avatar in lists and detail header

  @Prop({ type: [String], default: [] })
  detailImages!: string[]; // For Screenshots/Preview section in detail page

  // Legacy single category field (for backward compatibility)
  @Prop()
  category?: string;

  // New categories array field (max 3 categories)
  @Prop({ type: [String], default: [] })
  categories!: string[];

  // New fields for service detail page
  @Prop()
  tagline?: string;

  @Prop()
  fullDescription?: string;

  @Prop({ default: 0 })
  participantCount!: number;

  @Prop()
  developer?: string;

  // Legacy single fields (for backward compatibility)
  @Prop()
  language?: string;

  @Prop()
  platform?: string;

  // New array fields for multiple selections
  @Prop({ type: [String], default: [] })
  languages!: string[];

  @Prop({ type: [String], default: [] })
  platforms!: string[];

  @Prop()
  launchDate?: string;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
