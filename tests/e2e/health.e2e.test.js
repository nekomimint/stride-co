const request = require('supertest');                                                                                                                                          
    const { baseURL } = require('./helpers');                                                                                                                                      
                                                                                                                                                                                   
    describe('Health Check (E2E)', () => {                                                                                                                                         
      it('should return HTTP 200 and body {"status":"UP"}', async () => {                                                                                                          
        const response = await request(baseURL)                                                                                                                                    
          .get('/health')                                                                                                                                                          
          .expect(200);                                                                                                                                                            
                                                                                                                                                                                   
        expect(response.body).toEqual({ status: 'UP' });                                                                                                                           
      });                                                                                                                                                                          
    }); 