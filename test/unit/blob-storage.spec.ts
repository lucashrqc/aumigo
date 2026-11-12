import { describe, expect, it } from 'vitest'
import { DisabledBlobStorage } from '../../server/storage/blob-storage'

describe('DisabledBlobStorage', () => {
  it('rejects uploads with 501 when no token is configured', async () => {
    const storage = new DisabledBlobStorage()
    await expect(storage.handleClientUpload()).rejects.toMatchObject({
      statusCode: 501,
    })
  })

  it('rejects list/delete with 501 when no token is configured', async () => {
    const storage = new DisabledBlobStorage()
    await expect(storage.list()).rejects.toMatchObject({ statusCode: 501 })
    await expect(storage.delete()).rejects.toMatchObject({ statusCode: 501 })
  })
})
