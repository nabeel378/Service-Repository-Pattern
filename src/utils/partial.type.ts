type DTO<T> = {
    [P in {
        [K in keyof T]: undefined extends T[K] ? never : T[K] extends (...args: any) => any ? never : K;
    }[keyof T]]: T[P] extends object ? DTO<T[P]> : T[P];
} &
    Partial<
        {
            [P in {
                [K in keyof T]: undefined extends T[K] ? K : never;
            }[keyof T]]: T[P] extends object ? DTO<T[P]> : T[P];
        }
    >;
export { DTO }
export default Partial