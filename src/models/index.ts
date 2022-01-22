interface Model {
  id: string;
  updatedAt: number;
  createdAt: number;
}

export interface IEntry {
  name: string;
  required: boolean;
  multiline: boolean;
  type: "tel" | "email" | "text";
  placeholder: string;
  title: string;
  defaultValue: string;
  transformFunction?: (v: string) => string;
}

export interface namedType {
  id: string;
  name: string;
    url?: string;
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
  isRestricted: boolean;

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
  votingCategory?: namedType;
  isInstantUser: boolean;
  phoneNumber?: string;
  instagramUserName?: string;
  fbUserName?: string;
  showMyNumber?: boolean;
  picUrl: string;
  paid?: boolean;
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
  phoneNumber?: string | undefined;
  showMyNumber?: boolean | undefined;
  instagramUserName?: string | undefined;
  fbUserName?: string | undefined;
  picUrl: string;
  paid?: boolean | undefined;
  static defaultPic = "https://firebasestorage.googleapis.com/v0/b/quickvote-69134.appspot.com/o/android-chrome-512x512.png?alt=media&token=56001deb-5b25-4d19-970a-87e432052c96"

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
    this.stateCode = data.stateCode;
    this.isInstantUser = data.isInstantUser;
    this.phoneNumber = data.phoneNumber;

    this.showMyNumber = false;
    this.picUrl = !data.picUrl.length ? User.defaultPic
                        : data.picUrl;
    this.fbUserName = data.fbUserName;
    this.instagramUserName = data.instagramUserName;
    this.paid = data.paid || false;
  }

  getDetails(): any {
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
      isInstantUser: this.isInstantUser,
      phoneNumber: this.phoneNumber,
      showMyNumber: this.showMyNumber,
      instagramUserName: this.instagramUserName,
      fbUserName: this.fbUserName,
      picUrl: this.picUrl,
      paid: this.paid
    };
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
  profile: "Nothing",
  votes: 0,
  isInstantUser: false,
  picUrl: "",
});
