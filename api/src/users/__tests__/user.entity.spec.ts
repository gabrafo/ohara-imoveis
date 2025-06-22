import { User } from '../entities/users.entity';
import * as bcrypt from 'bcrypt';

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  hashSync: jest.fn().mockReturnValue('hash_mockado'),
}));

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash the password when it is not already a bcrypt hash', async () => {
      // Arrange
      user.password = 'senha123';
      
      // Act
      await user.hashPassword();
      
      // Assert
      expect(bcrypt.hashSync).toHaveBeenCalledWith('senha123', 10);
      expect(user.password).toBe('hash_mockado');
    });

    it('should not hash the password when it is already a bcrypt hash', async () => {
      // Arrange - Senha que já parece um hash bcrypt
      user.password = '$2a$10$abcdefghijklmnopqrstuv';
      
      // Act
      await user.hashPassword();
      
      // Assert
      expect(bcrypt.hashSync).not.toHaveBeenCalled();
      expect(user.password).toBe('$2a$10$abcdefghijklmnopqrstuv');
    });

    it('should handle null/undefined password', async () => {
      // Arrange
      user.password = undefined as any;
      
      // Act
      await user.hashPassword();
      
      // Assert
      expect(bcrypt.hashSync).not.toHaveBeenCalled();
      expect(user.password).toBeUndefined();
    });

    // Teste para diferentes formatos de hash bcrypt
    it('should recognize different valid bcrypt hash formats', async () => {
      const testCases = [
        '$2a$10$abcdefghijklmnopqrstuv',
        '$2b$10$abcdefghijklmnopqrstuv',
        '$2y$10$abcdefghijklmnopqrstuv'
      ];
      
      for (const hashValue of testCases) {
        // Reset para cada teste
        user.password = hashValue;
        jest.clearAllMocks();
        
        // Act
        await user.hashPassword();
        
        // Assert
        expect(bcrypt.hashSync).not.toHaveBeenCalled();
        expect(user.password).toBe(hashValue);
      }
    });
  });

  describe('parseBirthDate', () => {
    it('should convert string date in DD-MM-YYYY format to Date object', () => {
      // Arrange
      user.birthDate = '15-07-1990' as any;
      const expectedDate = new Date('1990-07-15');
      
      // Act
      user.parseBirthDate();
      
      // Assert
      expect(user.birthDate).toBeInstanceOf(Date);
      // Compare os valores de tempo para evitar problemas de fuso horário na comparação
      expect(user.birthDate.getTime()).toBe(expectedDate.getTime());
    });

    it('should not change birthDate if it is already a Date object', () => {
      // Arrange
      const dateObject = new Date('1990-07-15');
      user.birthDate = dateObject;
      
      // Act
      user.parseBirthDate();
      
      // Assert
      expect(user.birthDate).toBe(dateObject);
    });

    it('should handle undefined birthDate', () => {
      // Arrange
      user.birthDate = undefined as any;
      
      // Act
      user.parseBirthDate();
      
      // Assert
      expect(user.birthDate).toBeUndefined();
    });
    
    it('should handle other string formats correctly', () => {
      // Arrange - Caso inválido, mas devemos testar
      user.birthDate = '15/07/1990' as any;
      
      // Act
      user.parseBirthDate();
      
      // Assert - O comportamento esperado seria manter como string no caso de formato inválido
      expect(user.birthDate).toBe('15/07/1990');
    });
  });
}); 