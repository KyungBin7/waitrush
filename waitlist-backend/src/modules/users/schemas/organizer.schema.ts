import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizerDocument = Organizer & Document;

@Schema({
  timestamps: true,
  collection: 'organizers',
})
export class Organizer {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: false })
  passwordHash?: string;

  @Prop({
    type: [
      {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
      },
    ],
    default: [],
  })
  socialProviders?: {
    provider: string;
    providerId: string;
  }[];

  // Virtual field for auth methods - computed from passwordHash and socialProviders
  // Note: This getter works in TypeScript but for MongoDB queries, use the service layer computation
  get authMethods(): string[] {
    const methods: string[] = [];
    if (this.passwordHash) {
      methods.push('email');
    }
    if (this.socialProviders?.length) {
      this.socialProviders.forEach((provider) => {
        if (!methods.includes(provider.provider)) {
          methods.push(provider.provider);
        }
      });
    }
    return methods;
  }

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const OrganizerSchema = SchemaFactory.createForClass(Organizer);
