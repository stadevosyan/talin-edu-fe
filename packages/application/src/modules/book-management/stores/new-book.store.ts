import { inject, injectable } from '@servicetitan/react-ioc';
import { action, makeObservable, observable } from 'mobx';
import { FormState } from 'formstate';
import { formStateToJS, FormValidators, InputFieldState } from '@servicetitan/form';
import { CheckboxFieldState } from '@servicetitan/form-state';
import { CategoryEntity, CreateBookDto, ELibraryApi } from '../../common/api/e-library.client';
import { FilePickerStore } from '../../common/stores/file-picker.store';
import { LoadStatus } from '../../common/enums/load-status';
import { BooksStore } from './books.store';

export const requiredWithCustomText = (error: string) => (value: any) =>
    FormValidators.required(value) && error;

export const errorMessages = {
    RequiredTitle: 'Մուտքագրեք վերնագիրը',
    RequiredAuthor: 'Մուտքագրեք հեղինակին',
    RequiredDesc: 'Մուտքագրեք Նկարագրություն',
};

@injectable()
export class NewBookStore {
    @observable loading: LoadStatus = LoadStatus.None;
    @observable open = false;
    @observable categories = new Map();

    newBookForm = new FormState({
        title: new InputFieldState('').validators(
            requiredWithCustomText(errorMessages.RequiredTitle)
        ),
        author: new InputFieldState('').validators(
            requiredWithCustomText(errorMessages.RequiredAuthor),
            FormValidators.maxLength(124)
        ),
        description: new InputFieldState('').validators(
            requiredWithCustomText(errorMessages.RequiredDesc),
            FormValidators.maxLength(1024)
        ),
        categoryIds: new FormState<Map<number, CheckboxFieldState>>(new Map()),
        pictureUrl: new InputFieldState(''),
    });

    constructor(
        @inject(FilePickerStore) private readonly filePickerStore: FilePickerStore,
        @inject(ELibraryApi) private readonly eLibraryApi: ELibraryApi,
        @inject(BooksStore) private readonly booksStore: BooksStore
    ) {
        makeObservable(this);
        this.init().catch();
    }

    @action setLoading = (loading: LoadStatus) => (this.loading = loading);

    @action setOpen = (state: boolean) => (this.open = state);

    @action handleClose = () => {
        this.filePickerStore.deleteImage();
        this.newBookForm.reset();
        this.setOpen(false);
    };

    @action handleOpen = () => this.setOpen(true);

    init = async () => {
        const categories: CategoryEntity[] = (
            await this.eLibraryApi.categoryController_getCategories('')
        ).data as unknown as CategoryEntity[];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        categories[0].forEach(item => {
            this.categories.set(item.id, item.name);
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const category of categories[0]) {
            this.newBookForm.$.categoryIds.$.set(category.id, new CheckboxFieldState(false));
        }
    };

    createBook = async () => {
        const { hasError } = await this.newBookForm.validate();

        if (hasError || this.filePickerStore.error) {
            return false;
        }
        this.loading = LoadStatus.Loading;

        const { title, description, author } = formStateToJS(this.newBookForm);
        const profilePictureUrl = this.filePickerStore.imageUrlToSave;
        const categoryIds: number[] = [];
        this.newBookForm.$.categoryIds.$.forEach((category, id) => {
            if (category.value) {
                categoryIds.push(id);
            }
        });
        try {
            await this.eLibraryApi.booksController_addBook({
                title,
                description,
                author,
                pictureUrl: profilePictureUrl!,
                categoryIds,
            } as unknown as CreateBookDto);

            await this.booksStore.init();
            this.setOpen(false);
        } catch {
            // TODO error handling here
        } finally {
            this.loading = LoadStatus.Ok;
        }
    };
}
