import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WaitlistParticipantDocument = WaitlistParticipant & Document;

@Schema({
  timestamps: false,
  collection: 'waitlistParticipants',
})
export class WaitlistParticipant {
  @Prop({ type: Types.ObjectId, ref: 'Service', required: true, index: true })
  serviceId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  email!: string;

  @Prop({ default: Date.now })
  joinDate!: Date;
}

export const WaitlistParticipantSchema =
  SchemaFactory.createForClass(WaitlistParticipant);

// Create compound unique index for serviceId + email combination
WaitlistParticipantSchema.index({ serviceId: 1, email: 1 }, { unique: true });
