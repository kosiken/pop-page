
interface Model {
    id: string;
    updatedAt: number;
    createdAt: number;
}

export interface namedType {
    id: string;
    name: string;
}
export interface VotingCategory extends Model {
    name: string;
    numOfCandidates: number;
    numOfNominationEntries: number;
    winner?: namedType;
    createdBy: namedType;
    categoryShortText?: string;
    categoryDescription: string;
    nominationsIsActive: boolean;
    
    votingIsActive: boolean;
    [x: string]: any;

}

export interface NominationEntry extends Model {
    category: namedType;
    user: namedType;
    isApproved: boolean;
    categoryId: string;
    userId: string;
}

export interface IUser extends Model {
    name: string;
    email: string;
    stateCode?: string;
    profile: string;
    votes: number;
    isCandidate: boolean;
    isAdmin: boolean;
    votingCategory?:  namedType;
    isInstantUser: boolean;

}


export interface CandidateEntry extends Model {
    candidate: namedType;
   
    category: namedType;
    categoryId: string;
   candidateId: string;
   votes: number;

   
}
export interface Vote extends Model {
    candidate: namedType;
    voter: namedType;
    category: namedType;
    categoryId: string;
   candidateId: string;
   voterId: string;
}

export class User implements IUser {
    name: string;
    email: string;
    updatedAt: number;
    stateCode?: string | undefined;
    profile: string;
    votes: number;
    id: string;
    createdAt: number;
    isCandidate: boolean;
    isAdmin: boolean;
    votingCategory?: namedType | undefined;
    isInstantUser: boolean;

    constructor(data: IUser) {
        this.name = data.name;
        this.email = data.email;
        this.updatedAt = data.updatedAt;
        this.profile = data.profile;
        this.votes = data.votes;
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.isCandidate = data.isCandidate;
        this.isAdmin = data.isAdmin;
        this.votingCategory = data.votingCategory;
        this.stateCode  = data.stateCode;
        this.isInstantUser = data.isInstantUser

    }
   

    getDetails (): any {
        return {
            name: this.name,
            stateCode: this.stateCode,
            profile: this.profile,
        
            email: this.email,
            updatedAt: this.updatedAt,
   
            votes: this.votes,
           
            createdAt: this.createdAt,
            isCandidate: this.isCandidate,
            isAdmin: this.isAdmin,
            votingCategory: this.votingCategory,
            isInstantUser: this.isInstantUser
        }
    }

}

export const DefaultUser = new User({
    name: "Allison Kosy",
    email: "allisonkosy@gmail.com",
    id: "lion",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isAdmin: true,
    isCandidate: false,
    profile: 'Nothing',
    votes: 0,
    isInstantUser: false
})