public  class UpdateInformationCommand : IRequest<Result>
{
    public string Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? Details { get; set; }
    public string? CoverImageUrl { get; set; }
}
