declare module "bcrypt" {
  const bcrypt: {
    hash(data: string, saltOrRounds: number): Promise<string>;
  };
  export default bcrypt;
}
