import { describe, expect, it } from 'vitest'
import { DisabledBlobStorage } from '../../server/storage/blob-storage'

describe('DisabledBlobStorage', () => {
  it('rejects uploads with 501 when no token is configured', async () => {
    const storage = new DisabledBlobStorage()
    await expect(storage.handleClientUpload()).rejects.toMatchObject({
      statusCode: 501,
    })
  })
})
