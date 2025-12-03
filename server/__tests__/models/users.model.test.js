const User = require('../../modules/users/users.model')

describe('User Model Tests', () => {
  afterAll(async () => {
    await User.deleteMany({ username: /^modeltest_/ })
  })
  describe('Schema Validation', () => {
    it('should create a user with all required fields', async () => {
      const userData = {
        username: 'modeltest_user123',
        age: 20,
        name: 'Test User',
        email: 'test@iteso.mx',
        expediente: '123456',
        phone: '1234567890',
        password: 'password123',
        tags: ['deportes', 'música'],
        imageURI: 'test.jpg'
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser._id).toBeDefined()
      expect(savedUser.username).toBe(userData.username)
      expect(savedUser.age).toBe(userData.age)
      expect(savedUser.name).toBe(userData.name)
      expect(savedUser.email).toBe(userData.email)
      expect(savedUser.expediente).toBe(userData.expediente)
      expect(savedUser.phone).toBe(userData.phone)
      expect(savedUser.password).not.toBe(userData.password) // Password should be hashed
      expect(savedUser.tags).toEqual(userData.tags)
      expect(savedUser.imageURI).toBe(userData.imageURI)
    })

    it('should fail to create user without username', async () => {
      const userData = {
        age: 20,
        name: 'Test User',
        email: 'test@iteso.mx',
        expediente: '123456',
        phone: '1234567890',
        password: 'password123'
      }

      const user = new User(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it('should fail to create user without age', async () => {
      const userData = {
        username: 'testuser123',
        name: 'Test User',
        email: 'test@iteso.mx',
        expediente: '123456',
        phone: '1234567890',
        password: 'password123'
      }

      const user = new User(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it('should fail to create user without name', async () => {
      const userData = {
        username: 'testuser123',
        age: 20,
        email: 'test@iteso.mx',
        expediente: '123456',
        phone: '1234567890',
        password: 'password123'
      }

      const user = new User(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it('should fail to create user without email', async () => {
      const userData = {
        username: 'testuser123',
        age: 20,
        name: 'Test User',
        expediente: '123456',
        phone: '1234567890',
        password: 'password123'
      }

      const user = new User(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it('should fail to create user without expediente', async () => {
      const userData = {
        username: 'testuser123',
        age: 20,
        name: 'Test User',
        email: 'test@iteso.mx',
        phone: '1234567890',
        password: 'password123'
      }

      const user = new User(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it('should fail to create user without phone', async () => {
      const userData = {
        username: 'testuser123',
        age: 20,
        name: 'Test User',
        email: 'test@iteso.mx',
        expediente: '123456',
        password: 'password123'
      }

      const user = new User(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it('should fail to create user without password', async () => {
      const userData = {
        username: 'testuser123',
        age: 20,
        name: 'Test User',
        email: 'test@iteso.mx',
        expediente: '123456',
        phone: '1234567890'
      }

      const user = new User(userData)

      await expect(user.save()).rejects.toThrow()
    })

    it('should create user without tags (optional field)', async () => {
      const userData = {
        username: 'modeltest_notags',
        age: 20,
        name: 'Test User',
        email: 'test_notags@iteso.mx',
        expediente: '123457',
        phone: '1234567891',
        password: 'password123'
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser._id).toBeDefined()
      expect(savedUser.tags).toBeDefined()
    })

    it('should create user without imageURI (optional field)', async () => {
      const userData = {
        username: 'modeltest_noimage',
        age: 20,
        name: 'Test User',
        email: 'test_noimage@iteso.mx',
        expediente: '123458',
        phone: '1234567892',
        password: 'password123'
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser._id).toBeDefined()
      expect(savedUser.imageURI).toBeUndefined()
    })
  })

  describe('Field Type Validation', () => {
    it('should accept valid age as number', async () => {
      const userData = {
        username: 'modeltest_age',
        age: 25,
        name: 'Test User',
        email: 'test_age@iteso.mx',
        expediente: '123459',
        phone: '1234567893',
        password: 'password123'
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser.age).toBe(25)
      expect(typeof savedUser.age).toBe('number')
    })

    it('should accept tags as array of strings', async () => {
      const userData = {
        username: 'modeltest_tags',
        age: 20,
        name: 'Test User',
        email: 'test_tags@iteso.mx',
        expediente: '123460',
        phone: '1234567894',
        password: 'password123',
        tags: ['deportes', 'música', 'tecnología']
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(Array.isArray(savedUser.tags)).toBe(true)
      expect(savedUser.tags.length).toBe(3)
      expect(savedUser.tags).toContain('deportes')
    })

    it('should accept empty tags array', async () => {
      const userData = {
        username: 'modeltest_emptytags',
        age: 20,
        name: 'Test User',
        email: 'test_emptytags@iteso.mx',
        expediente: '123461',
        phone: '1234567895',
        password: 'password123',
        tags: []
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(Array.isArray(savedUser.tags)).toBe(true)
      expect(savedUser.tags.length).toBe(0)
    })
  })

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'mySecretPassword123'
      const userData = {
        username: 'modeltest_hash',
        age: 20,
        name: 'Test User',
        email: 'test_hash@iteso.mx',
        expediente: '123462',
        phone: '1234567896',
        password: plainPassword
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser.password).not.toBe(plainPassword)
      expect(savedUser.password.length).toBeGreaterThan(20) // Bcrypt hashes are long
      expect(savedUser.password).toMatch(/^\$2[aby]\$/) // Bcrypt format
    })
  })

  describe('Unique Constraints', () => {
    it('should not allow duplicate usernames', async () => {
      const userData1 = {
        username: 'modeltest_duplicateuser',
        age: 20,
        name: 'User One',
        email: 'user1@iteso.mx',
        expediente: '111111',
        phone: '1111111111',
        password: 'password123'
      }

      const userData2 = {
        username: 'modeltest_duplicateuser', // Same username
        age: 22,
        name: 'User Two',
        email: 'user2@iteso.mx',
        expediente: '222222',
        phone: '2222222222',
        password: 'password456'
      }

      const user1 = new User(userData1)
      await user1.save()

      const user2 = new User(userData2)
      await expect(user2.save()).rejects.toThrow()
    })
  })

  describe('Special Characters', () => {
    it('should accept names with special characters and accents', async () => {
      const userData = {
        username: 'modeltest_special',
        age: 20,
        name: 'José María Ñoño',
        email: 'test_special@iteso.mx',
        expediente: '123463',
        phone: '1234567897',
        password: 'password123'
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser.name).toBe('José María Ñoño')
    })

    it('should accept tags with special characters', async () => {
      const userData = {
        username: 'modeltest_specialtags',
        age: 20,
        name: 'Test User',
        email: 'test_specialtags@iteso.mx',
        expediente: '123464',
        phone: '1234567898',
        password: 'password123',
        tags: ['música', 'español', 'programación']
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser.tags).toContain('música')
      expect(savedUser.tags).toContain('español')
    })
  })
})
