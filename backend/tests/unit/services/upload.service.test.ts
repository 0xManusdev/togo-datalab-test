
import { config } from '../../../src/config/environment';

describe('UploadService', () => {
    let UploadService: any;
    let uploadService: any;

    let mockUpload: jest.Mock;
    let mockRemove: jest.Mock;
    let mockGetPublicUrl: jest.Mock;
    let mockFrom: jest.Mock;

    beforeAll(() => {
        mockUpload = jest.fn();
        mockRemove = jest.fn();
        mockGetPublicUrl = jest.fn();

        mockFrom = jest.fn(() => ({
            upload: mockUpload,
            remove: mockRemove,
            getPublicUrl: mockGetPublicUrl,
        }));

        jest.doMock('@supabase/supabase-js', () => ({
            createClient: jest.fn(() => ({
                storage: {
                    from: mockFrom,
                },
            })),
        }));

        const serviceModule = require('@/services/upload.service');
        UploadService = serviceModule.UploadService;
    });

    beforeEach(() => {
        mockUpload.mockReset();
        mockRemove.mockReset();
        mockGetPublicUrl.mockReset();
        mockFrom.mockClear();

        uploadService = new UploadService();
    });

    describe('uploadVehicleImage', () => {
        const mockFile = {
            mimetype: 'image/jpeg',
            buffer: Buffer.from('test'),
        } as unknown as Express.Multer.File;

        it('devrait uploader une image et retourner son URL publique', async () => {
            mockUpload.mockResolvedValue({ error: null });
            mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://test.com/image.jpg' } });

            const result = await uploadService.uploadVehicleImage(mockFile);

            expect(mockFrom).toHaveBeenCalledWith(config.bucketName);
            expect(mockUpload).toHaveBeenCalled();
            expect(result).toBe('https://test.com/image.jpg');
        });

        it('devrait lever une erreur si l\'upload échoue', async () => {
            mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

            await expect(uploadService.uploadVehicleImage(mockFile))
                .rejects.toThrow('Erreur lors de l\'upload: Upload failed');
        });
    });

    describe('deleteVehicleImage', () => {
        it('devrait supprimer une image valide', async () => {
            const imageUrl = `${config.bucketName}/vehicles/test-image.jpg`;
            mockRemove.mockResolvedValue({ error: null });

            await uploadService.deleteVehicleImage(imageUrl);

            expect(mockRemove).toHaveBeenCalledWith(['vehicles/test-image.jpg']);
        });

        it('devrait ignorer si l\'URL ne contient pas le nom du bucket', async () => {
            await uploadService.deleteVehicleImage('https://other-bucket/image.jpg');
            expect(mockRemove).not.toHaveBeenCalled();
        });

        it('devrait gérer les URL mal formées', async () => {
            await uploadService.deleteVehicleImage(config.bucketName);
            expect(mockRemove).not.toHaveBeenCalled();
        });
    });
});
