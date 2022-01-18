
interface Model {
    id: string;
    updatedAt: number;
    createdAt: number;
}

interface IUser extends Model {
    name: string;
    email: string;
  
    profile: string;
    votes: number;

}

interface Vote extends Model {
    candidate: string;
    voter: string;
    
}

export class User implements IUser {
    name: string;
    email: string;
    updatedAt: number;
    profile: string;
    votes: number;
    id: string;
    createdAt: number;

    constructor(data: IUser) {
        this.name = data.name;
        this.email = data.email;
        this.updatedAt = data.updatedAt;
        this.profile = data.profile;
        this.votes = data.votes;
        this.id = data.id;
        this.createdAt = data.createdAt;
    }
   

}