import { IEndConfigAccess, IEndMethod } from '../../ends/IEnd.js';
import IRouter from '../IRouter';
import Ends from '../../ends/ends.js';
import { localized } from '../../helpers/stringHelper.js';
import LoginRepo from '../../repos/user/loginRepo.js';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const fastify = require('fastify')({
//   logger: true,
//   ajv: {
//     customOptions: { allErrors: true },
//     plugins: [require('ajv-errors')]
//   }
// });
import Fastify from 'fastify';
import ajvErrors from 'ajv-errors';
const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: { allErrors: true },
    plugins: [ajvErrors]
  }
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
fastify.register(import('@fastify/cors'), {});
// eslint-disable-next-line @typescript-eslint/no-var-requires
fastify.register(import('fastify-file-upload'), {});
// eslint-disable-next-line @typescript-eslint/no-var-requires
fastify.register(import('@fastify/formbody'), {});

const httpRouter: IRouter = {
  async start() {
    for (const endpoint of Ends) {
      const preHandler = async (request: any, reply: any) => {
        // check access control
        if (endpoint.configuration?.access === IEndConfigAccess.public) {
          const loginObj = await LoginRepo.findByToken(request.headers.lt);
          if (loginObj) request.loginObj = loginObj;
          return;
        } else if (endpoint.configuration.access === IEndConfigAccess.logins) {
          request.loginObj = await LoginRepo.findByToken(request.headers.lt);
          if (request.loginObj) return; // grant access
        } else if (
          endpoint.configuration.access === IEndConfigAccess.systemRoles
        ) {
          // TODO::
        }
        // no access
        return reply.code(403).send('Access Error!');
      };
      fastify.route({
        method: endpoint.method,
        url: endpoint.url,
        schema: endpoint.schema,

        preHandler: preHandler,
        handler: async (request: any, reply: any) => {
          const input =
            endpoint.method === IEndMethod.POST
              ? request.body
              : {
                  ...request.params,
                  ...request.query
                };
          const headers = {
            loginToken: request.headers.lt,
            loginObj: request.loginObj
          };
          try {
            const response = await endpoint.handler(headers, input || {});
            if (response.statusCode === 302) {
              return reply.redirect(response.response.url);
            } else if (response.statusCode === 206) {
              return reply
                .code(response.statusCode)
                .type(response.response.mimeType)
                .send(response.response.media);
            }
            return reply.code(response.statusCode).send(response.response);
          } catch (error: any) {
            if (error.message?.startsWith('err.'))
              reply.code(400).send({
                message: localized(error.message, request.headers?.ln)
              });
            else
              reply.code(500).send({
                message:
                  process.env.DEBUG === 'true' ? error.message : 'unknown'
              });
          }
        }
      });
    }
    try {
      await fastify.listen({
        host: '0.0.0.0',
        port: parseInt(process.env.HTTP_PORT || '37700')
      });
      // eslint-disable-next-line no-console
      console.log('server started...');
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }
};

export default httpRouter;
