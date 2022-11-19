import { inject, injectable } from '@servicetitan/react-ioc';

import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { Storage } from '../utils/storage';
import { ELibraryApi, LoginUserDto, UserEntity } from '../api/e-library.client';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const AUTHENTICATED_USER_KEY = 'AuthenticatedUser';
export const AUTHENTICATED_USER_TOKEN = 'AuthToken';

@injectable()
export class AuthStore {
    @observable user?: UserEntity;

    @computed get isAuthenticated() {
        return !!this.user;
    }

    @computed get isAdmin() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.user?.role === 0;
    }

    @computed get isUser() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.user?.role === 1;
    }

    constructor(@inject(ELibraryApi) private readonly api: ELibraryApi) {
        makeObservable(this);

        this.setAlreadyAuthenticatedUser();
        this.handle401();
    }

    login = async (user: LoginUserDto) => {
        const { data: tokenData } = await this.api.authController_signInUser(user);
        const token = tokenData.access_token;

        // TODO: might use this usersController_getUserById
        Storage.setItem(AUTHENTICATED_USER_TOKEN, token);
        this.setupOrResetToken(token);

        const { data: userData } = await this.api.usersController_getMyProfile();
        runInAction(() => (this.user = userData));
        Storage.setItem(AUTHENTICATED_USER_KEY, userData);
    };

    @action logout = () => {
        Storage.removeItem(AUTHENTICATED_USER_KEY);
        Storage.removeItem(AUTHENTICATED_USER_TOKEN);
        this.setupOrResetToken();
        this.user = undefined;
    };

    @action setAlreadyAuthenticatedUser = () => {
        const authToken = Storage.getItem(AUTHENTICATED_USER_TOKEN);
        if (authToken) {
            this.setupOrResetToken(authToken);
            this.user = JSON.parse(Storage.getItem(AUTHENTICATED_USER_KEY));
        }
    };

    setupOrResetToken = (token?: string) => {
        axios.interceptors.request.use((params: AxiosRequestConfig) => {
            if (params.headers) {
                if (token) {
                    params.headers.Authorization = `Bearer ${token}`;
                } else {
                    params.headers.Authorization = '';
                }
            }

            return params;
        });
    };

    handle401 = () => {
        axios.interceptors.response.use((params: AxiosResponse) => {
            if (params.status === 401) {
                if (this.isAuthenticated) {
                    this.logout();
                }
            }
            return params;
        });
    };
}
