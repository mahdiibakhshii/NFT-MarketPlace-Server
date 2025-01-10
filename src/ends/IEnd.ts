import { FastifySchema } from 'fastify/types/schema';
import { ILogin } from '@models/login';

export enum IEndConfigAccess {
  systemRoles = 0,
  public = 1,
  logins = 2
}

export interface IEndConfig {
  access: IEndConfigAccess;
  //systemRoles?: IUserRole[]
}

export enum IEndMethod {
  GET = 'GET',
  POST = 'POST'
}

type IEndUrl = string;

export interface IEndHead {
  loginToken?: string;
  loginObj?: ILogin;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEndInput {}

export interface IEndOutput<T> {
  statusCode: number;
  response: T;
}

export interface IEndDocs<T> {
  name: string;
  description: string;
  sampleInput: T;
  enums?: { [key: string]: any };
}

export default interface IEnd<I extends IEndInput, O> {
  configuration: IEndConfig;
  method: IEndMethod;
  url: IEndUrl;
  schema: FastifySchema;
  handler: (heads: IEndHead, input: I) => Promise<IEndOutput<O>>;
  docs: IEndDocs<I>;
}

// pagination services ////////////////////////////////
export interface IEndPaginateInput extends IEndInput {
  page: number;
  limit: number;
}

export interface IEndPaginateResponse<T> {
  data: T[];
  count: number;
}

///////////////////////////////////////////////////////
