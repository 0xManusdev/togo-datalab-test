import { config } from '@/config/environment';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

const BUCKET_NAME = config.bucketName;

export class UploadService {
    async uploadVehicleImage(file: Express.Multer.File): Promise<string> {
        const fileExtension = file.mimetype.split('/')[1];
        const fileName = `${randomUUID()}.${fileExtension}`;
        const filePath = `vehicles/${fileName}`;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new Error(`Erreur lors de l'upload: ${error.message}`);
        }

        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    }

    async deleteVehicleImage(imageUrl: string): Promise<void> {
        if (!imageUrl || !imageUrl.includes(BUCKET_NAME)) {
            return;
        }

        const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
        if (urlParts.length < 2) return;

        const filePath = urlParts[1];

        await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);
    }
}
